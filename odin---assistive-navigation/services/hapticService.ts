
class HapticService {
  public vibrate(intensity: 'low' | 'medium' | 'high' | 'off') {
    if (intensity === 'off' || !navigator.vibrate) return;

    const patterns = {
      low: [50],
      medium: [150, 50, 150],
      high: [300, 100, 300, 100, 300]
    };

    navigator.vibrate(patterns[intensity]);
  }

  public triggerDanger() {
    if (!navigator.vibrate) return;
    navigator.vibrate([500, 100, 500, 100, 500]);
  }
}

export const hapticService = new HapticService();
