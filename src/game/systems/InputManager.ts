import Phaser from 'phaser';
import { InputSnapshot } from '../config/types';

export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    jump: Phaser.Input.Keyboard.Key;
    dash: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    reset: Phaser.Input.Keyboard.Key;
    debug: Phaser.Input.Keyboard.Key;
  };

  // Input buffer timestamps
  private jumpBufferTimestamp: number = 0;
  private dashBufferTimestamp: number = 0;

  // Direction priority tracking (for "last pressed wins")
  private leftPressedTime: number = 0;
  private rightPressedTime: number = 0;

  // Current frame inputs
  public horizontalInput: number = 0;
  public verticalInput: number = 0;
  public jumpPressed: boolean = false;
  public jumpJustPressed: boolean = false;
  public jumpReleased: boolean = false;
  public dashJustPressed: boolean = false;
  public downPressed: boolean = false;

  // Debug toggle
  public debugJustPressed: boolean = false;
  public resetJustPressed: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupInputs();
  }

  private setupInputs(): void {
    if (!this.scene.input.keyboard) {
      console.error('Keyboard input not available');
      return;
    }

    this.cursors = this.scene.input.keyboard.createCursorKeys();

    this.keys = {
      jump: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
      dash: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT),
      left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      reset: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      debug: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F1)
    };
  }

  update(): void {
    const now = this.scene.time.now;

    // Track when direction keys are pressed
    const leftDown = this.cursors.left?.isDown || this.keys.left?.isDown;
    const rightDown = this.cursors.right?.isDown || this.keys.right?.isDown;

    // Update press timestamps (only on initial press)
    if (leftDown && this.leftPressedTime === 0) {
      this.leftPressedTime = now;
    } else if (!leftDown) {
      this.leftPressedTime = 0;
    }

    if (rightDown && this.rightPressedTime === 0) {
      this.rightPressedTime = now;
    } else if (!rightDown) {
      this.rightPressedTime = 0;
    }

    // Update horizontal input with "last pressed wins" for conflicting inputs
    if (leftDown && rightDown) {
      // Both pressed - use the most recently pressed direction
      this.horizontalInput = this.leftPressedTime > this.rightPressedTime ? -1 : 1;
    } else if (leftDown) {
      this.horizontalInput = -1;
    } else if (rightDown) {
      this.horizontalInput = 1;
    } else {
      this.horizontalInput = 0;
    }

    // Update vertical input
    this.verticalInput = 0;
    if (this.cursors.up?.isDown) {
      this.verticalInput -= 1;
    }
    if (this.cursors.down?.isDown || this.keys.down?.isDown) {
      this.verticalInput += 1;
    }
    this.downPressed = this.verticalInput > 0;

    // Update jump states
    const jumpKeyDown = this.cursors.up?.isDown || this.keys.jump?.isDown;
    const jumpKeyJustDown =
      Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.up);
    const jumpKeyJustUp =
      Phaser.Input.Keyboard.JustUp(this.keys.jump) ||
      Phaser.Input.Keyboard.JustUp(this.cursors.up);

    this.jumpPressed = jumpKeyDown;
    this.jumpJustPressed = jumpKeyJustDown;
    this.jumpReleased = jumpKeyJustUp;

    // Buffer jump input
    if (this.jumpJustPressed) {
      this.jumpBufferTimestamp = this.scene.time.now;
    }

    // Update dash
    this.dashJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.dash);
    if (this.dashJustPressed) {
      this.dashBufferTimestamp = this.scene.time.now;
    }

    // Debug and reset keys
    this.debugJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.debug);
    this.resetJustPressed = Phaser.Input.Keyboard.JustDown(this.keys.reset);
  }

  isJumpBuffered(bufferWindow: number): boolean {
    if (this.jumpBufferTimestamp === 0) return false;
    return this.scene.time.now - this.jumpBufferTimestamp < bufferWindow;
  }

  consumeJumpBuffer(): boolean {
    if (this.jumpBufferTimestamp > 0) {
      this.jumpBufferTimestamp = 0;
      return true;
    }
    return false;
  }

  isDashBuffered(bufferWindow: number): boolean {
    if (this.dashBufferTimestamp === 0) return false;
    return this.scene.time.now - this.dashBufferTimestamp < bufferWindow;
  }

  consumeDashBuffer(): boolean {
    if (this.dashBufferTimestamp > 0) {
      this.dashBufferTimestamp = 0;
      return true;
    }
    return false;
  }

  getSnapshot(): InputSnapshot {
    return {
      horizontal: this.horizontalInput,
      jumpPressed: this.jumpPressed,
      jumpJustPressed: this.jumpJustPressed,
      jumpReleased: this.jumpReleased,
      dashJustPressed: this.dashJustPressed
    };
  }

  destroy(): void {
    // Keys are managed by the scene, no explicit cleanup needed
  }
}
