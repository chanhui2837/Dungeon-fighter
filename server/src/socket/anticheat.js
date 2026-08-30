export function validateMovement(player, newPos, now) {
  const dt = now - player.lastMoveAt;
  // ignore first move
  if (dt <= 0) return { ok: true };
  // prevent teleport: max speed = player spd (approx 130-200) px/sec
  const maxSpd = (player.stats?.spd || 130) * 1.6; // allow 60% margin for lag
  const maxDist = (maxSpd * dt) / 1000 + 12; // tolerance
  const dist = Math.hypot(newPos.x - player.x, newPos.y - player.y);
  if (dist > maxDist) {
    console.warn(`[AC] movement reject ${player.username} dist ${dist.toFixed(1)} > max ${maxDist.toFixed(1)} dt ${dt}`);
    return { ok: false, reason: 'speedhack' };
  }
  // world bounds
  if (newPos.x < 0 || newPos.x > 1600 || newPos.y < 0 || newPos.y > 1200) return { ok: false, reason: 'oob' };
  return { ok: true };
}

export function validateAttack(player, dist) {
  const maxRange = 90; // melee + lag tolerance
  if (dist > maxRange) return false;
  return true;
}

export function validateSkill(player, skill, now) {
  const cdUntil = player.skillCooldowns[skill.id] || 0;
  if (now < cdUntil) return { ok: false, reason: `cooldown ${Math.ceil((cdUntil-now)/1000)}s` };
  if (player.mp < skill.mp) return { ok: false, reason: 'not_enough_mp' };
  const needLv = skill.unlockLv || 1;
  if ((player.level||1) < needLv) return { ok: false, reason: 'level_locked' };
  return { ok: true };
}
