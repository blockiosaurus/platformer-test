import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { InputSnapshot, PlayerDebugInfo } from '../config/types';
import { LevelObjects } from '../levels/LevelBuilder';

export class DebugRenderer {
  private scene: Phaser.Scene;
  private graphics: Phaser.GameObjects.Graphics;
  private textObjects: Map<string, Phaser.GameObjects.Text>;
  private levelObjects?: LevelObjects;

  // Panel UI elements
  private panelBackground!: Phaser.GameObjects.Rectangle;
  private panelHeader!: Phaser.GameObjects.Text;
  private panelCollapsed: boolean = false;

  public enabled: boolean = true;
  public showVelocityVector: boolean = true;
  public showCollisionBox: boolean = true;
  public showPlatformBoxes: boolean = true;
  public showStateLabel: boolean = true;
  public showTimers: boolean = true;
  public showInputs: boolean = true;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(1000);
    this.textObjects = new Map();
    this.createPanel();
  }

  private createPanel(): void {
    // Create collapsible header
    this.panelHeader = this.scene.add.text(10, 10, '[-] Debug Info', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'monospace',
      backgroundColor: '#000000cc',
      padding: { x: 6, y: 4 }
    });
    this.panelHeader.setScrollFactor(0);
    this.panelHeader.setDepth(1002);
    this.panelHeader.setInteractive({ useHandCursor: true });
    this.panelHeader.on('pointerdown', () => this.togglePanel());

    // Create background
    this.panelBackground = this.scene.add.rectangle(10, 30, 160, 200, 0x000000, 0.75);
    this.panelBackground.setOrigin(0, 0);
    this.panelBackground.setScrollFactor(0);
    this.panelBackground.setDepth(1000);
  }

  private togglePanel(): void {
    this.panelCollapsed = !this.panelCollapsed;
    this.panelHeader.setText(this.panelCollapsed ? '[+] Debug Info' : '[-] Debug Info');
    this.panelBackground.setVisible(!this.panelCollapsed);

    // Hide/show content
    for (const [key, text] of this.textObjects) {
      if (key !== 'stateLabel') { // State label follows player, not in panel
        text.setVisible(!this.panelCollapsed && this.enabled);
      }
    }
  }

  toggle(): void {
    this.enabled = !this.enabled;
    this.panelHeader.setVisible(this.enabled);
    this.panelBackground.setVisible(this.enabled && !this.panelCollapsed);
    if (!this.enabled) {
      this.clear();
    }
  }

  setLevelObjects(levelObjects: LevelObjects): void {
    this.levelObjects = levelObjects;
  }

  clear(): void {
    this.graphics.clear();
    for (const text of this.textObjects.values()) {
      text.setVisible(false);
    }
  }

  render(player: Player, inputs: InputSnapshot): void {
    this.graphics.clear();

    if (!this.enabled) {
      for (const text of this.textObjects.values()) {
        text.setVisible(false);
      }
      return;
    }

    const body = player.body as Phaser.Physics.Arcade.Body;
    const debugInfo = player.getDebugInfo();

    if (this.showCollisionBox) {
      this.drawCollisionBox(body);
    }

    if (this.showPlatformBoxes && this.levelObjects) {
      this.drawPlatformBoxes();
    }

    if (this.showVelocityVector) {
      this.drawVelocityVector(player.x, player.y, body.velocity);
    }

    if (this.showStateLabel) {
      this.drawStateLabel(player.x, player.y - 40, debugInfo);
    }

    if (this.showTimers) {
      this.drawTimers(debugInfo);
    }

    if (this.showInputs) {
      this.drawInputs(inputs);
    }

    this.drawFlags(debugInfo);
  }

  private drawCollisionBox(body: Phaser.Physics.Arcade.Body): void {
    // Draw body bounds
    this.graphics.lineStyle(1, 0xffff00, 0.8);
    this.graphics.strokeRect(body.x, body.y, body.width, body.height);

    // Draw center point
    this.graphics.fillStyle(0xffff00, 1);
    this.graphics.fillCircle(body.center.x, body.center.y, 2);
  }

  private drawPlatformBoxes(): void {
    if (!this.levelObjects) return;

    // Draw static platforms (green)
    this.graphics.lineStyle(1, 0x00ff00, 0.6);
    this.levelObjects.platforms.children.iterate((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
      if (body) {
        this.graphics.strokeRect(body.x, body.y, body.width, body.height);
      }
      return true;
    });

    // Draw walls (cyan)
    this.graphics.lineStyle(1, 0x00ffff, 0.6);
    this.levelObjects.walls.children.iterate((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
      if (body) {
        this.graphics.strokeRect(body.x, body.y, body.width, body.height);
      }
      return true;
    });

    // Draw one-way platforms (magenta)
    this.graphics.lineStyle(1, 0xff00ff, 0.6);
    this.levelObjects.oneWayPlatforms.children.iterate((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      const body = sprite.body as Phaser.Physics.Arcade.StaticBody;
      if (body) {
        this.graphics.strokeRect(body.x, body.y, body.width, body.height);
      }
      return true;
    });

    // Draw moving platforms (orange)
    this.graphics.lineStyle(1, 0xff8800, 0.6);
    this.levelObjects.movingPlatforms.children.iterate((child) => {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      const body = sprite.body as Phaser.Physics.Arcade.Body;
      if (body) {
        this.graphics.strokeRect(body.x, body.y, body.width, body.height);
      }
      return true;
    });
  }

  private drawVelocityVector(x: number, y: number, velocity: Phaser.Math.Vector2): void {
    const scale = 0.15;
    const maxLength = 100;

    // Clamp velocity visualization
    const vx = Phaser.Math.Clamp(velocity.x * scale, -maxLength, maxLength);
    const vy = Phaser.Math.Clamp(velocity.y * scale, -maxLength, maxLength);

    // Draw X component (red)
    if (Math.abs(vx) > 1) {
      this.graphics.lineStyle(2, 0xff4444, 0.8);
      this.graphics.lineBetween(x, y, x + vx, y);
    }

    // Draw Y component (blue)
    if (Math.abs(vy) > 1) {
      this.graphics.lineStyle(2, 0x4444ff, 0.8);
      this.graphics.lineBetween(x, y, x, y + vy);
    }

    // Draw combined vector (green)
    const length = Math.sqrt(vx * vx + vy * vy);
    if (length > 1) {
      this.graphics.lineStyle(2, 0x44ff44, 0.8);
      this.graphics.lineBetween(x, y, x + vx, y + vy);

      // Arrow head
      const angle = Math.atan2(vy, vx);
      const arrowSize = 6;
      this.graphics.lineBetween(
        x + vx,
        y + vy,
        x + vx - Math.cos(angle - 0.3) * arrowSize,
        y + vy - Math.sin(angle - 0.3) * arrowSize
      );
      this.graphics.lineBetween(
        x + vx,
        y + vy,
        x + vx - Math.cos(angle + 0.3) * arrowSize,
        y + vy - Math.sin(angle + 0.3) * arrowSize
      );
    }
  }

  private drawStateLabel(x: number, y: number, info: PlayerDebugInfo): void {
    const key = 'stateLabel';
    let text = this.textObjects.get(key);

    if (!text) {
      text = this.scene.add.text(0, 0, '', {
        fontSize: '12px',
        color: '#ffffff',
        backgroundColor: '#000000aa',
        padding: { x: 4, y: 2 }
      });
      text.setDepth(1001);
      this.textObjects.set(key, text);
    }

    text.setText(info.state.toUpperCase());
    text.setPosition(x - text.width / 2, y);
    text.setVisible(true);
  }

  private drawTimers(info: PlayerDebugInfo): void {
    if (this.panelCollapsed) return;

    const key = 'timers';
    let text = this.textObjects.get(key);

    if (!text) {
      text = this.scene.add.text(18, 38, '', {
        fontSize: '11px',
        color: '#cccccc',
        fontFamily: 'monospace',
        lineSpacing: 2
      });
      text.setDepth(1001);
      text.setScrollFactor(0);
      this.textObjects.set(key, text);
    }

    const lines = [
      `State: ${info.state}`,
      `Pos: (${info.position.x}, ${info.position.y})`,
      `Vel: (${info.velocity.x}, ${info.velocity.y})`,
      `Coyote: ${info.coyoteTimer.toFixed(0)}ms`,
      `Dash CD: ${info.dashCooldown.toFixed(0)}ms`,
      `Jumps: ${info.jumpsRemaining}`,
      `Dashes: ${info.dashesRemaining}`
    ];

    text.setText(lines.join('\n'));
    text.setVisible(true);
  }

  private drawInputs(inputs: InputSnapshot): void {
    if (this.panelCollapsed) return;

    const key = 'inputs';
    let text = this.textObjects.get(key);

    if (!text) {
      text = this.scene.add.text(18, 148, '', {
        fontSize: '11px',
        color: '#cccccc',
        fontFamily: 'monospace'
      });
      text.setDepth(1001);
      text.setScrollFactor(0);
      this.textObjects.set(key, text);
    }

    const h = inputs.horizontal;
    const dirStr = h < 0 ? '<' : h > 0 ? '>' : '-';

    const lines = [
      `Input: [${dirStr}]`,
      `Jump: ${inputs.jumpPressed ? 'HELD' : inputs.jumpJustPressed ? 'PRESS' : '-'}`,
      `Dash: ${inputs.dashJustPressed ? 'PRESS' : '-'}`
    ];

    text.setText(lines.join('\n'));
    text.setVisible(true);
  }

  private drawFlags(info: PlayerDebugInfo): void {
    if (this.panelCollapsed) return;

    const key = 'flags';
    let text = this.textObjects.get(key);

    if (!text) {
      text = this.scene.add.text(18, 200, '', {
        fontSize: '11px',
        fontFamily: 'monospace'
      });
      text.setDepth(1001);
      text.setScrollFactor(0);
      this.textObjects.set(key, text);
    }

    const flags = [
      { name: 'GND', active: info.isGrounded },
      { name: 'WALL', active: info.isTouchingWall },
      { name: 'APEX', active: info.isAtApex },
      { name: 'DASH', active: info.canDash }
    ];

    const flagStr = flags
      .map(f => (f.active ? `[${f.name}]` : ` ${f.name} `))
      .join(' ');

    text.setText(flagStr);
    text.setStyle({
      color: '#88ff88'
    });
    text.setVisible(true);
  }

  destroy(): void {
    this.graphics.destroy();
    this.panelHeader.destroy();
    this.panelBackground.destroy();
    for (const text of this.textObjects.values()) {
      text.destroy();
    }
    this.textObjects.clear();
  }
}
