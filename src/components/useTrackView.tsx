import { useEffect } from 'react';

// Type definition for the hook's input and possible backend response
interface TrackViewMutationResponse {
  // Define the expected structure of your backend response here
  message: string;
}

// // The hook's main functionality
// function useTrackViews(pollId: string): UseMutationResult<TrackViewMutationResponse, unknown, void, unknown> {
//   // Using react-query's useMutation to handle the backend request
//   const mutation = useMutation<TrackViewMutationResponse, unknown, void>(() => {
//     // Define how to send the view increase request to your backend here
//     // This is a placeholder URL and fetch request
//     return fetch('https://your-backend.com/api/views/increase', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ pollId }),
//     }).then((res) => res.json());
//   });

//   useEffect(() => {
//     const viewedPolls = localStorage.getItem('viewedPolls') ? JSON.parse(localStorage.getItem('viewedPolls')!) : [];

//     // Check if the pollId is not already saved in localStorage
//     if (!viewedPolls.includes(pollId)) {
//       // Add the pollId to the array and save it back to localStorage
//       viewedPolls.push(pollId);
//       localStorage.setItem('viewedPolls', JSON.stringify(viewedPolls));

//       // Trigger the mutation to increase the view count in the backend
//       mutation.mutate();
//     }
//   }, [pollId, mutation]);

//   return mutation;
// }

// export default useTrackViews;
