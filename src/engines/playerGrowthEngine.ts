import type { Player } from '../types';

export function evolvePlayerAttributes(player: Player): Player {
  const updated = { ...player };
  const attrs = { ...updated.attributi };

  // Age progression
  if (player.eta < 23) {
    // High growth
    if (player.valoreGenerale < player.potenziale) {
      const growthPoints = Math.random() < 0.7 ? 1 : 0;
      updated.valoreGenerale = Math.min(player.potenziale, updated.valoreGenerale + growthPoints);
      
      // Upgrade random relevant attributes
      if (Math.random() < 0.5) attrs.velocita = Math.min(20, attrs.velocita + 1);
      if (Math.random() < 0.5) attrs.tecnica = Math.min(20, attrs.tecnica + 1);
      if (Math.random() < 0.5) attrs.passaggio = Math.min(20, attrs.passaggio + 1);
    }
  } else if (player.eta > 31) {
    // Physical decline
    if (Math.random() < 0.6) {
      attrs.velocita = Math.max(5, attrs.velocita - 1);
      attrs.resistenza = Math.max(5, attrs.resistenza - 1);
      updated.valoreGenerale = Math.max(50, updated.valoreGenerale - 1);
    }
    // Mental wisdom increases
    if (Math.random() < 0.4) {
      attrs.posizionamento = Math.min(20, attrs.posizionamento + 1);
      attrs.virtus = Math.min(20, attrs.virtus + 1);
    }
  }

  // Morale & condition natural recovery
  updated.condizione = Math.min(100, updated.condizione + 15);
  updated.attributi = attrs;

  return updated;
}
