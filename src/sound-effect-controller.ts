import { CameraTrait, Vector2, WorldEvent } from "@remvst/game-model";
import { ReusablePool, ReusablePoolBindable } from "@remvst/optimization";
import { WorldSoundController } from "./world-sound-controller";

export class SoundEffectController<EventType extends WorldEvent>
    implements ReusablePoolBindable
{
    protected worldSoundController: WorldSoundController;
    protected event: EventType;
    protected position: Vector2 | null;
    private cachedCamera: CameraTrait;

    collapseGroup: string | null = null;
    collapseToNewest: boolean = true;

    pool: ReusablePool<this>;

    private worldSoundControllerAgeAtCreation: number = 0;
    protected removeCallback: () => void;

    bind(worldSoundController: WorldSoundController, event: EventType) {
        this.worldSoundController = worldSoundController;
        this.event = event;

        this.worldSoundControllerAgeAtCreation = worldSoundController.age;
    }

    postBind() {}

    protected get camera(): CameraTrait {
        if (!this.cachedCamera) {
            for (const camera of this.worldSoundController.world.entities.bucket(
                CameraTrait.key,
            )) {
                this.cachedCamera = camera.traitOfType(CameraTrait);
                return this.cachedCamera;
            }
            throw new Error("No camera found");
        }
        return this.cachedCamera;
    }

    setPosition(position: Vector2 | null): this {
        this.position = position;
        return this;
    }

    setCollapseGroup(group: string, collapseToNewest = true): this {
        this.collapseGroup = group;
        this.collapseToNewest = collapseToNewest;
        return this;
    }

    tearDown() {
        this.position = null;
        this.event = null;
        this.removeCallback = null;
        this.worldSoundControllerAgeAtCreation = null;

        if (this.pool) {
            this.pool.give(this);
        }
    }

    protected prepareForReuse() {
        this.pool.give(this);
    }

    update() {
        // TODO update position
    }

    pause() {}

    resume() {}

    setVolume(volume: number) {}

    setRate(rate: number) {}

    async removeEmitter(): Promise<void> {
        return new Promise((resolve) => {
            this.removeCallback = resolve;
        });
    }

    protected get age(): number {
        return (
            this.worldSoundController.age -
            this.worldSoundControllerAgeAtCreation
        );
    }
}
