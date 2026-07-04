import React, { useState } from 'react';

export default function Logo({ dark }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="logo" style={{ color: dark ? '#14121A' : '#fff' }}>
        Zara<span> Handmade</span>
      </div>
    );
  }

  return (
    <img
      src="/logo.png"
      alt="Zara Handmade"
      className="logo-img"
      onError={() => setFailed(true)}
    />
  );
}
