import React from 'react';
import { MoleculeStudio } from '@quimicarush/molecule-canvas';

/**
 * Standalone Molecule Studio.
 *
 * The shell itself lives in @quimicarush/molecule-canvas so the QuímicaRush web
 * app can open the very same editor full-screen from its Laboratório tab.
 */
export const App: React.FC = () => (
  <div className="w-screen h-screen overflow-hidden">
    <MoleculeStudio />
  </div>
);
