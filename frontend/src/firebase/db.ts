import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import type { Patient, PredictionRecord } from '../types';

// Patients Collection
const patientsRef = collection(db, 'patients');
const predictionsRef = collection(db, 'predictions');

export const addPatient = async (patientData: Omit<Patient, 'createdAt' | 'updatedAt'>) => {
  return await addDoc(patientsRef, {
    ...patientData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const getPatientsByUser = async (userId: string) => {
  const q = query(patientsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
};

export const getPatientById = async (patientId: string) => {
  const docRef = doc(db, 'patients', patientId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Patient;
  }
  return null;
};

export const updatePatient = async (patientId: string, data: Partial<Patient>) => {
  const docRef = doc(db, 'patients', patientId);
  return await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deletePatient = async (patientId: string) => {
  const docRef = doc(db, 'patients', patientId);
  return await deleteDoc(docRef);
};

// Predictions Collection
export const addPredictionRecord = async (predictionData: Omit<PredictionRecord, 'createdAt'>) => {
  return await addDoc(predictionsRef, {
    ...predictionData,
    createdAt: serverTimestamp(),
  });
};

export const getPredictionsByPatient = async (patientId: string) => {
  const q = query(predictionsRef, where('patientId', '==', patientId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PredictionRecord));
};

export const getPredictionsByUser = async (userId: string) => {
  const q = query(predictionsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PredictionRecord));
};
