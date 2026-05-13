'use client'

import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { submitVote } from '@/app/actions';

export default function ParticipantPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = React.use(params);
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fonction de récupération des données
  const fetchData = async () => {
    try {
      const res = await fetch(`/session/${code}/api`);
      if (!res.ok) throw new Error("Erreur réseau");
      const data = await res.json();
      setSessionData(data);
    } catch (err) {
      console.error("Erreur fetchData:", err);
    } finally {
      setLoading(false);
    }
  };

  // LE VOICI : Le branchement WebSocket
  useEffect(() => {
    // 1. On initialise la route API Socket
    fetch('/api/socket');

    // 2. On se connecte au chemin défini dans ton SocketHandler
    const socket = io({ path: '/api/socket' });

    // 3. On écoute l'événement 'update-view' que tu as créé
    socket.on('update-view', () => {
      console.log("Signal reçu : Mise à jour de la question !");
      fetchData(); // On recharge les données sans rafraîchir la page
    });

    // Nettoyage à la fermeture de l'onglet
    return () => {
      socket.disconnect();
    };
  }, [code]);

  // Premier chargement des données
  useEffect(() => {
    fetchData();
  }, [code]);
};