import { SmoothTargetFollowingTrait, WorldEvent } from "@remvst/game-model";
import { pointDistance } from "@remvst/geometry";
import { Howl } from "howler";
import { SoundEffectController } from "./sound-effect-controller";

export type HowlAndSprite = [Howl, string | undefined];
export type HowlOrHowlAndSprite = Howl | HowlAndSprite;

export class HowlSoundEffectController<
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

    protected updatePosition() {
        if (!this.position) return;

        const halfDiagonal =
            pointDistance(0, 0, this.camera.width, this.camera.height) / 2;

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
                    refDistance: halfDiagonal * 0.5 * this.refRelativeDistance,
                    rolloffFactor: 100,
                    distanceModel: "linear",
                },
                this.howlId,
            );
        }
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

        if (!this.howl) {
            const [howl, sprite] =
                this.howlsAndSprites[
                    Math.floor(Math.random() * this.howlsAndSprites.length)
                ];

            this.howl = howl;
            this.howl.volume(this.volume * this.masterVolume);
            this.howl.rate(this.rate);

            this.howlId = this.howl.play(sprite || undefined);
            this.howl.once("end", () => this.onHowlEnd(), this.howlId);
        } else {
            this.howl.play(this.howlId);
        }

        this.updatePosition();
    }
}
