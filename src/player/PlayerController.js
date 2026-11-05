export class PlayerController {
  constructor(player) {
    this.player = player;
  }

  handleAction(action) {
    if (this.player.isDead) return;

    switch (action) {
      case 'MOVE_LEFT':
        this.player.physics.changeLane(-1);
        break;
      case 'MOVE_RIGHT':
        this.player.physics.changeLane(1);
        break;
      case 'JUMP':
        this.player.physics.jump();
        break;
      case 'SLIDE':
        this.player.physics.slide();
        break;
      case 'ACTIVATE_ABILITY':
        this.player.transformation.activateTransformation();
        break;
      default:
        break;
    }
  }
}
