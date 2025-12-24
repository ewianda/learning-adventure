import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  Child,
  DailyActivity,
  Difficulty,
  Parent,
  SpellingResult,
} from "../types";
import { db } from "./firebaseConfig";
import { generateDailyActivityContent } from "./geminiService";

const PARENTS_COLLECTION = "parents";
const ACTIVITIES_COLLECTION = "activities";

const normalizeChild = (child: Partial<Child>): Child => ({
  id: child.id as string,
  name: child.name as string,
  gradeLevel: child.gradeLevel as string,
  avatar: child.avatar as string,
  spellingProgress: child.spellingProgress ? [...child.spellingProgress] : [],
});

const normalizeParent = (
  id: string,
  data: Record<string, unknown>
): Parent => ({
  id,
  username: data.username as string,
  email: data.email as string,
  children: Array.isArray(data.children)
    ? (data.children as Partial<Child>[]).map(normalizeChild)
    : [],
});

export const createParentProfile = async (
  parentId: string,
  profile: { username: string; email: string }
): Promise<Parent> => {
  const parentRef = doc(db, PARENTS_COLLECTION, parentId);
  await setDoc(
    parentRef,
    {
      username: profile.username,
      email: profile.email,
      children: [],
    },
    { merge: true }
  );
  const snapshot = await getDoc(parentRef);
  return normalizeParent(snapshot.id, snapshot.data() || {});
};

export const ensureParentProfile = async (
  parentId: string,
  profile: { username: string; email: string }
): Promise<Parent> => {
  console.log("Ensuring parent profile for ID:", parentId);
  const parentRef = doc(db, PARENTS_COLLECTION, parentId);
  console.log("Fetching parent profile from Firestore...");
  const snapshot = await getDoc(parentRef);
  console.log("Parent profile snapshot exists:", snapshot.exists());
  if (!snapshot.exists()) {
    return createParentProfile(parentId, profile);
  }
  return normalizeParent(snapshot.id, snapshot.data() || {});
};

export const getParent = async (parentId: string): Promise<Parent> => {
  const snapshot = await getDoc(doc(db, PARENTS_COLLECTION, parentId));
  if (!snapshot.exists()) {
    throw new Error("Parent profile not found.");
  }
  return normalizeParent(snapshot.id, snapshot.data() || {});
};

const randomId = () =>
  crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export const addChild = async (
  parentId: string,
  childData: Omit<Child, "id" | "spellingProgress">
): Promise<Parent> => {
  const parentRef = doc(db, PARENTS_COLLECTION, parentId);
  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(parentRef);
    if (!snapshot.exists()) {
      throw new Error("Parent profile not found.");
    }
    const data = snapshot.data() || {};
    const parent = normalizeParent(snapshot.id, data);
    const newChild: Child = {
      ...childData,
      id: randomId(),
      spellingProgress: [],
    };
    const updatedChildren = [...parent.children, newChild];
    transaction.update(parentRef, { children: updatedChildren });
    return { ...parent, children: updatedChildren };
  });
};

const determineNextDifficulty = (activities: DailyActivity[]): Difficulty => {
  if (!activities.length) return "Easy";
  const [latest] = activities
    .filter((activity) => activity.status === "graded")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (!latest || !latest.score) return "Easy";
  if (latest.score.overall >= 80) return "Hard";
  if (latest.score.overall >= 50) return "Medium";
  return "Easy";
};

const fetchChildActivities = async (
  childId: string
): Promise<DailyActivity[]> => {
  const activitiesQuery = query(
    collection(db, ACTIVITIES_COLLECTION),
    where("childId", "==", childId),
    orderBy("date", "desc")
  );
  const snapshot = await getDocs(activitiesQuery);
  return snapshot.docs.map((docItem) => docItem.data() as DailyActivity);
};

export const getDailyActivity = async (
  child: Child
): Promise<DailyActivity> => {
  const today = new Date().toISOString().split("T")[0];
  const activityId = `${child.id}_${today}`;
  const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
  const snapshot = await getDoc(activityRef);
  if (snapshot.exists()) {
    return snapshot.data() as DailyActivity;
  }

  const previousActivities = await fetchChildActivities(child.id);
  const difficulty = determineNextDifficulty(previousActivities);
  const content = await generateDailyActivityContent(
    child.gradeLevel,
    difficulty
  );
  const newActivity: DailyActivity = {
    id: activityId,
    childId: child.id,
    date: today,
    mathQuestions: content.mathQuestions,
    readingPassage: content.readingPassage,
    readingQuestions: content.readingQuestions,
    status: "pending",
  };
  await setDoc(activityRef, newActivity);
  return newActivity;
};

export const markActivityAsViewed = async (
  activityId: string
): Promise<void> => {
  const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
  await updateDoc(activityRef, { status: "viewed" });
};

export const gradeActivity = async (
  activityId: string,
  mathCorrect: number,
  readingCorrect: number
): Promise<DailyActivity> => {
  const activityRef = doc(db, ACTIVITIES_COLLECTION, activityId);
  const snapshot = await getDoc(activityRef);
  if (!snapshot.exists()) {
    throw new Error("Activity not found.");
  }
  const activity = snapshot.data() as DailyActivity;
  const mathScore = (mathCorrect / activity.mathQuestions.length) * 100;
  const readingScore =
    (readingCorrect / activity.readingQuestions.length) * 100;
  const updated: DailyActivity = {
    ...activity,
    status: "graded",
    score: {
      math: mathScore,
      reading: readingScore,
      overall: (mathScore + readingScore) / 2,
    },
  };
  await setDoc(activityRef, updated, { merge: true });
  return updated;
};

export const getChildProgress = async (
  childId: string
): Promise<DailyActivity[]> => {
  const activities = await fetchChildActivities(childId);
  return activities.filter((activity) => activity.status !== "pending");
};

export const saveSpellingResult = async (
  parentId: string,
  childId: string,
  result: Omit<SpellingResult, "timestamp">
): Promise<void> => {
  const parentRef = doc(db, PARENTS_COLLECTION, parentId);
  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(parentRef);
    if (!snapshot.exists()) {
      throw new Error("Parent profile not found.");
    }
    const parent = normalizeParent(snapshot.id, snapshot.data() || {});
    const childIndex = parent.children.findIndex(
      (child) => child.id === childId
    );
    if (childIndex === -1) {
      throw new Error("Child not found for parent.");
    }
    const newResult: SpellingResult = {
      ...result,
      timestamp: Date.now(),
    };
    const updatedChildren = [...parent.children];
    const targetChild = { ...updatedChildren[childIndex] };
    targetChild.spellingProgress = [
      newResult,
      ...(targetChild.spellingProgress || []),
    ];
    updatedChildren[childIndex] = targetChild;
    transaction.update(parentRef, { children: updatedChildren });
  });
};

export const getSpellingProgress = async (
  parentId: string,
  childId: string
): Promise<SpellingResult[]> => {
  const parentSnapshot = await getDoc(doc(db, PARENTS_COLLECTION, parentId));
  if (!parentSnapshot.exists()) {
    return [];
  }
  const parent = normalizeParent(
    parentSnapshot.id,
    parentSnapshot.data() || {}
  );
  const child = parent.children.find((c) => c.id === childId);
  if (!child) {
    return [];
  }
  return [...(child.spellingProgress || [])].sort(
    (a, b) => b.timestamp - a.timestamp
  );
};
