import type { Poll } from '@/models/types';
import React from 'react';

export default function OpenGraph({ data }: { data: Poll }) {
  return (
    <div
      style={{
        background: '#fefbfb',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Roboto, sans-serif'
      }}
    >
      <div
        style={{
          border: '4px solid #000',
          background: '#fefbfb',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '2rem',
          padding: '2rem',
          width: '88%',
          height: '80%',
          position: 'relative' // Ensuring relative positioning for absolute positioning inside
        }}
      >
        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#1a202c'
          }}
        >
          {data.question}
        </h1>

        <div
          style={{
            position: 'absolute',
            left: '20px',
            bottom: '20px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            style={{
              height: '32px',
              width: '32px',
              marginRight: '8px',
              color: '#718096'
            }}
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            {data.votes}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            right: '20px',
            bottom: '20px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}
        >
          openpoll.app
        </div>
      </div>
    </div>
  );
}
