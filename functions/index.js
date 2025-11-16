import fetch from 'node-fetch';
import * as functions from 'firebase-functions';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAppCheck } from 'firebase-admin/app-check';

// Basic CORS headers (adjust origin if you want to restrict)
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Firebase-AppCheck'
};

if (!getApps().length) {
  initializeApp();
}

const EXPECTED_ACTION = 'quiz_submit';
const MIN_SCORE = 0.5; // adjust threshold as needed

const appCheck = getAppCheck();

export const verifyRecaptchaV3AndSaveQuiz = functions.region('europe-west1').https.onRequest(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set(CORS_HEADERS);
    return res.status(204).send('');
  }
  if (req.method !== 'POST') {
    res.set(CORS_HEADERS);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.set(CORS_HEADERS);

  const appCheckToken = req.header('X-Firebase-AppCheck');
  if (appCheckToken) {
    try {
      await appCheck.verifyToken(appCheckToken);
    } catch (error) {
      console.warn('App Check token verification failed', error);
      return res.status(401).json({ error: 'Invalid App Check token' });
    }
  }

  try {
    const { token, answers, breakdown, totalAnswers, uid, name, isGuest } = req.body || {};
    if (!token || !Array.isArray(answers) || !breakdown || typeof totalAnswers !== 'number' || !uid) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Verify token via standard reCAPTCHA v3 endpoint
    const secret = functions.config().recaptcha?.secret;
    if (!secret) {
      return res.status(500).json({ error: 'Missing reCAPTCHA secret configuration' });
    }

    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', token);
    params.append('remoteip', req.ip);

    const verifyResp = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });

    if (!verifyResp.ok) {
      const text = await verifyResp.text();
      return res.status(502).json({ error: 'Siteverify request failed', detail: text });
    }

    const verify = await verifyResp.json();
    if (!verify.success) {
      return res.status(403).json({ error: 'Invalid reCAPTCHA token', codes: verify['error-codes'] });
    }
    if (verify.action && verify.action !== EXPECTED_ACTION) {
      return res.status(403).json({ error: 'Action mismatch', action: verify.action });
    }
    const score = typeof verify.score === 'number' ? verify.score : 0;
    if (score < MIN_SCORE) {
      return res.status(403).json({ error: 'Low score', score });
    }

    // At this point token is valid and trustworthy enough; save quiz result & preferences
    const db = getFirestore();

    const quizDoc = {
      uid,
      name: name || 'Utente',
      isGuest: !!isGuest,
      totalAnswers,
      answers,
      breakdown,
      createdAt: FieldValue.serverTimestamp()
    };

    const batch = db.batch();
    const quizRef = db.collection('quizResults').doc();
    batch.set(quizRef, quizDoc);

    const prefRef = db.collection('users').doc(uid).collection('preferences').doc('current');
    const topGenres = breakdown.slice(0, 5).map(e => ({ id: e.id, label: e.label, percentage: e.percentage, color: e.color, count: e.count }));
    const prefDoc = {
      uid,
      name: name || 'Utente',
      isGuest: !!isGuest,
      totalAnswers,
      topGenres,
      breakdown: topGenres,
      updatedAt: FieldValue.serverTimestamp()
    };
    batch.set(prefRef, prefDoc, { merge: true });

    await batch.commit();
    return res.status(200).json({ success: true, score, quizResultId: quizRef.id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error', detail: (err && err.message) || 'unknown' });
  }
});
