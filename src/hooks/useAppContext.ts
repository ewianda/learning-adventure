import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { Parent, Child } from "../types";
import * as firestoreService from "../services/firestoreService";
import { auth } from "../services/firebaseConfig";

type AuthMode = "signin" | "signup";

interface LoginPayload {
  email: string;
  password: string;
  mode: AuthMode;
  username?: string;
}

interface AppContextType {
  parent: Parent | null;
  selectedChild: Child | null;
  viewingProgressFor: Child | null;
  isDoingActivity: boolean;
  isPracticingSpelling: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  selectChild: (childId: string) => void;
  unselectChild: () => void;
  addChild: (
    childData: Omit<Child, "id" | "spellingProgress">
  ) => Promise<void>;
  viewProgress: (child: Child) => void;
  exitProgressView: () => void;
  startActivity: () => void;
  endActivity: () => void;
  startSpellingPractice: () => void;
  endSpellingPractice: () => void;
  refreshParentData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [parent, setParent] = useState<Parent | null>(null);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [viewingProgressFor, setViewingProgressFor] = useState<Child | null>(
    null
  );
  const [isDoingActivity, setIsDoingActivity] = useState(false);
  const [isPracticingSpelling, setIsPracticingSpelling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setParent(null);
        setSelectedChild(null);
        setViewingProgressFor(null);
        return;
      }
      try {
        const profile = await firestoreService.ensureParentProfile(
          firebaseUser.uid,
          {
            username:
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "Parent",
            email: firebaseUser.email || "",
          }
        );
        setParent(profile);
      } catch (error) {
        console.error("Failed to load parent profile:", error);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async ({ email, password, mode, username }: LoginPayload) => {
    setIsLoading(true);
    try {
      if (mode === "signup") {
        const credentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        if (username) {
          await updateProfile(credentials.user, { displayName: username });
        }
        await firestoreService.createParentProfile(credentials.user.uid, {
          username: username || email.split("@")[0],
          email,
        });
      } else {
        const credentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log("Signed in user:", credentials.user);
        await firestoreService.ensureParentProfile(credentials.user.uid, {
          username: credentials.user.displayName || email.split("@")[0],
          email: credentials.user.email || email,
        });
      }
      setSelectedChild(null);
      setViewingProgressFor(null);
      setIsDoingActivity(false);
      setIsPracticingSpelling(false);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshParentData = async () => {
    if (!parent) return;
    setIsLoading(true);
    try {
      const updatedParent = await firestoreService.getParent(parent.id);
      setParent(updatedParent);
      if (selectedChild) {
        const updatedChild =
          updatedParent.children.find(
            (child) => child.id === selectedChild.id
          ) || null;
        setSelectedChild(updatedChild);
      }
      if (viewingProgressFor) {
        const updatedViewChild =
          updatedParent.children.find(
            (child) => child.id === viewingProgressFor.id
          ) || null;
        setViewingProgressFor(updatedViewChild);
      }
    } catch (error) {
      console.error("Failed to refresh parent data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setParent(null);
    setSelectedChild(null);
    setViewingProgressFor(null);
    setIsDoingActivity(false);
    setIsPracticingSpelling(false);
  };

  const selectChild = (childId: string) => {
    const child = parent?.children.find((c) => c.id === childId) || null;
    setSelectedChild(child);
    setViewingProgressFor(null);
  };

  const unselectChild = () => {
    setSelectedChild(null);
  };

  const addChild = async (
    childData: Omit<Child, "id" | "spellingProgress">
  ) => {
    if (!parent) return;
    setIsLoading(true);
    try {
      const updatedParent = await firestoreService.addChild(
        parent.id,
        childData
      );
      setParent(updatedParent);
    } catch (error) {
      console.error("Failed to add child:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const viewProgress = (child: Child) => {
    setViewingProgressFor(child);
    setSelectedChild(null);
  };

  const exitProgressView = () => {
    setViewingProgressFor(null);
  };

  const startActivity = () => {
    if (selectedChild) setIsDoingActivity(true);
  };

  const endActivity = () => setIsDoingActivity(false);

  const startSpellingPractice = () => {
    if (selectedChild) setIsPracticingSpelling(true);
  };

  const endSpellingPractice = () => setIsPracticingSpelling(false);

  const value = {
    parent,
    selectedChild,
    viewingProgressFor,
    isDoingActivity,
    isPracticingSpelling,
    isLoading,
    login,
    logout,
    selectChild,
    unselectChild,
    addChild,
    viewProgress,
    exitProgressView,
    startActivity,
    endActivity,
    startSpellingPractice,
    endSpellingPractice,
    refreshParentData,
  };

  return React.createElement(AppContext.Provider, { value }, children);
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
