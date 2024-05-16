import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateNFT from './CreateNFT';


export default function HomePage() {
  let navigate = useNavigate();

  function handleClick() {
    navigate('/image');
  }
  return (
    <div>
<CreateNFT />
    </div>
  );
}
