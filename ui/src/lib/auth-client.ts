import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: "http://localhost:4000", // API base URL
});

export const { signIn, signUp, useSession, signOut } = authClient;
