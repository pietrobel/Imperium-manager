import type { Player } from '../types';

export function checkRetirement(player: Player): { shouldRetire: boolean; farewellMessage?: string } {
  if (player.eta < 32) return { shouldRetire: false };

  // Retirement probability scales with age and physical decline
  const retireProbability = (player.eta - 31) * 0.25;
  if (Math.random() < retireProbability) {
    return {
      shouldRetire: true,
      farewellMessage: `${player.nome} ${player.cognome} appende i calzari al chiodo all'età di ${player.eta} anni, ringraziando gli dei e i tifosi per gli onori ricevuti nell'arena.`
    };
  }

  return { shouldRetire: false };
}
