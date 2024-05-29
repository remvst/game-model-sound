import {
    SmoothTargetFollowingTrait,
    WorldEvent,
    pointDistance,
} from "@remvst/game-model";
import { Howl } from "howler";
import { SoundEffectController } from "./sound-effect-controller";

export type HowlAndSprite = [Howl, string | undefined];
export type HowlOrHowlAndSprite = Howl | HowlAndSprite;

export class SimpleSoundEffectController<
    EventType extends WorldEvent,
> extends SoundEffectController<EventType> {
    private howlsAndSprites: HowlAndSprite[] = [];

    protected howlId: number;
    protected howl: Howl;

    private playing = false;

    private volume = 1;
    private masterVolume = 1;
    private rate = 1;

    minDistanceToPosition = 0;

    constructor(
        howlsAndSprites: HowlOrHowlAndSprite[],
        private readonly refRelativeDistance: number = 1,
    ) {
        super();

        for (const sound of howlsAndSprites) {
            if (sound instanceof Howl) {
                this.howlsAndSprites.push([sound, undefined]);
            } else {
                this.howlsAndSprites.push(sound);
            }
        }
    }

    setVolume(volume: number): void {
        this.volume = volume;
        if (this.howl) {
            this.howl.volume(this.volume * this.masterVolume, this.howlId);
        }
    }

    setMasterVolume(volume: number): void {
        this.masterVolume = volume;
        if (this.howl) {
            this.howl.volume(this.volume * this.masterVolume, this.howlId);
        }
    }

    setRate(rate: number): void {
        this.rate = rate;
        if (this.howl) {
            this.howl.rate(this.rate, this.howlId);
        }
    }

    postBind(): void {
        const [howl, sprite] = this.howlsAndSprites[Math.floor(Math.random() * this.howlsAndSprites.length)];

        this.howl = howl;
        this.howl.volume(this.volume * this.masterVolume);
        this.howl.rate(this.rate);

        this.howlId = this.howl.play(sprite || undefined);

        this.playing = true;

        this.howl.once("end", () => this.onHowlEnd(), this.howlId);

        const halfDiagonal =
            pointDistance(0, 0, this.camera.width, this.camera.height) / 2;

        if (this.position) {
            const { target } = this.camera.entity!.traitOfType(
                SmoothTargetFollowingTrait,
            );
            const x = this.position.x - (target || this.camera.entity).x;
            const y = this.position.y - (target || this.camera.entity).y;
            if (
                Math.abs(x) > this.minDistanceToPosition ||
                Math.abs(y) > this.minDistanceToPosition
            ) {
                this.howl.pos(x, y, 0, this.howlId);
                this.howl.pannerAttr(
                    {
                        panningModel: "HRTF",
                        refDistance:
                            halfDiagonal * 0.5 * this.refRelativeDistance,
                        rolloffFactor: 100,
                        distanceModel: "linear",
                    },
                    this.howlId,
                );
            }
        }
    }

    updatePosition() {
        const { position } = this;
        if (!position) return;

        const { howl, howlId } = this;
        if (!howl || !howlId) return;

        const smoothTargetFollowingTrait = this.camera.entity?.traitOfType(
            SmoothTargetFollowingTrait,
        );
        if (!smoothTargetFollowingTrait) return;

        const { target } = smoothTargetFollowingTrait;
        if (!target) return;

        const x = position.x - (target || this.camera.entity).x;
        const y = position.y - (target || this.camera.entity).y;

        if (
            Math.abs(x) < this.minDistanceToPosition ||
            Math.abs(y) < this.minDistanceToPosition
        )
            return;

        const halfDiagonal =
            pointDistance(0, 0, this.camera.width, this.camera.height) / 2;
        howl.pos(x, y, 0, howlId);
        howl.pannerAttr(
            {
                panningModel: "HRTF",
                refDistance: halfDiagonal * 0.5 * this.refRelativeDistance,
                rolloffFactor: 100,
                distanceModel: "linear",
            },
            howlId,
        );
    }

    tearDown(): void {
        super.tearDown();

        if (this.howl && this.howlId) {
            this.howl?.stop(this.howlId);
        }

        this.howl = null;
        this.howlId = null;
    }

    protected onHowlEnd() {
        this.removeCallback?.();
    }

    pause(): void {
        if (!this.playing) return;
        this.playing = false;
        this.howl.pause(this.howlId);
    }

    resume(): void {
        if (this.playing) return;
        this.playing = true;
        this.howl.play(this.howlId);
    }
}
