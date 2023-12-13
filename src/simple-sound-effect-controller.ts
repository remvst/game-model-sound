import { randPick } from '@remvst/random';
import { Howl } from 'howler';
import { SmoothTargetFollowingTrait, WorldEvent, pointDistance } from '@remvst/game-model';
import { SoundEffectController } from "./sound-effect-controller";

export class SimpleSoundEffectController<EventType extends WorldEvent> extends SoundEffectController<EventType> {

    private howlId: number;
    private howl: Howl;

    private volume = 1;
    private rate = 1;

    minDistanceToPosition = 0;

    constructor(
        private readonly howls: Howl[],
        private readonly refRelativeDistance: number = 1,
    ) {
        super();
    }

    setVolume(volume: number): void {
        this.volume = volume;
        if (this.howl) {
            this.howl.volume(this.volume);
        }
    }

    setRate(rate: number): void {
        this.rate = rate;
        if (this.howl) {
            this.howl.rate(this.rate);
        }
    }

    postBind(): void {
        this.howl = randPick(this.howls);
        this.howl.volume(this.volume);
        this.howl.rate(this.rate);
        this.howlId = this.howl.play();
        this.howl.once('end', () => this.onHowlEnd(), this.howlId);

        const halfDiagonal = pointDistance(0, 0, this.camera.width, this.camera.height) / 2;

        if (this.position) {
            const smoothTargetFollowingTrait = this.camera.entity!.traitOfType(SmoothTargetFollowingTrait);

            const { target } = this.camera.entity!.traitOfType(SmoothTargetFollowingTrait);
            const x = this.position.x - (target || this.camera.entity).x;
            const y = this.position.y - (target || this.camera.entity).y;
            if (Math.abs(x) > this.minDistanceToPosition || Math.abs(y) > this.minDistanceToPosition) {
                this.howl.pos(x, y, 0, this.howlId);
                this.howl.pannerAttr({
                    panningModel: 'HRTF',
                    refDistance: halfDiagonal * 0.5 * this.refRelativeDistance,
                    rolloffFactor: 100,
                    distanceModel: 'linear'
                }, this.howlId);
            }
        }
    }

    updatePosition() {
        const { position } = this;
        if (!position) return;

        const { howl, howlId } = this;
        if (!howl || !howlId) return;

        const smoothTargetFollowingTrait = this.camera.entity?.traitOfType(SmoothTargetFollowingTrait);
        if (!smoothTargetFollowingTrait) return;

        const { target } = smoothTargetFollowingTrait;
        if (!target) return;

        const x = position.x - (target || this.camera.entity).x;
        const y = position.y - (target || this.camera.entity).y;

        if (Math.abs(x) < this.minDistanceToPosition || Math.abs(y) < this.minDistanceToPosition) return;

        const halfDiagonal = pointDistance(0, 0, this.camera.width, this.camera.height) / 2;
        howl.pos(x, y, 0, howlId);
        howl.pannerAttr({
            panningModel: 'HRTF',
            refDistance: halfDiagonal * 0.5 * this.refRelativeDistance,
            rolloffFactor: 100,
            distanceModel: 'linear'
        }, howlId);
    }

    tearDown(): void {
        super.tearDown();
        this.howl?.stop(this.howlId);
    }

    protected onHowlEnd() {
        this.removeCallback?.();
    }

    pause(): void {
        this.howl.pause(this.howlId);
    }

    resume(): void {
        this.howl.play(this.howlId);
    }
}
