import React from 'react';
import { Github, LogOut, Loader2 } from 'lucide-react';
import { authClient } from '@/lib/auth-client';


export const GithubLogin = () => {
  const { data: session, isPending } = authClient.useSession();

  return (
    <div className="">
      {isPending ? (
        <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 px-2 py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      ) : session ? (
        <div className="flex flex-col items-start space-y-2 px-2 py-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Signed in as</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{session.user.email}</span>
          <button
            onClick={() => authClient.signOut()}
            className="flex items-center w-full p-2 mt-1 text-sm text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group transition"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => authClient.signIn.social({ provider: 'github' })}
          className="flex items-center w-full p-2 text-sm text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group transition"
        >
          <Github className="w-4 h-4 mr-2 text-blue-500" />
          Sign in with GitHub
        </button>
      )}
    </div>
  );
};

export default GithubLogin;
