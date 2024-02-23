import { AUDIO } from '$lib/defaults.js';
import { localPersisted } from '$lib/stores/clientPersisted.js';
import type { Readable } from '$lib/stores/types.js';
import { writable } from 'svelte/store';


type PersistedAudioSettings = {
    muted: boolean;
    volume: number;
    volume_music: number;
    volume_sfx: number;
};

type ValidTracks = (
    'music_game.mp3' | 'music_lobby.mp3' |
    'sfx_abucheo.mp3' | 'sfx_aplauso.mp3' | 'sfx_lose.mp3' | 'sfx_meh.mp3' |
    'sfx_menuselect.mp3' |
    'sfx_modifier_1.mp3' | 'sfx_modifier_2.mp3' | 'sfx_modifier_3.mp3' | 'sfx_modifier_4.mp3' | 'sfx_modifier_5.mp3' |
    'sfx_round.mp3' |
    // eslint-disable-next-line @typescript-eslint/ban-types
    (string & {})
);

type TrackType = 'music' | 'sfx' | 'none';

type AudioPlayerState = ({
    type: Extract<TrackType, 'none'>;
    audio: undefined;
    track: undefined;
} | {
    type: Exclude<TrackType, 'none'>;
    audio: HTMLAudioElement;
    track: string;
}) & {
    isPaused: boolean;
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    volumeMusic: number;
    volumeSfx: number;
};

type PlayOptions = {
    overlap?: 'stop' | 'pause' | 'true';
    loop?: boolean;
    duration?: number;
    volume?: number;
    volumeMusic?: number;
    volumeSfx?: number;
};

type AudioPlayerStore<T = ValidTracks> = Readable<AudioPlayerState> & {
    play: (track: T, config?: PlayOptions) => void;
    pause: (track?: T) => void;
    resume: (track?: T) => void;
    stop: (track?: T) => void;
    mute: () => void;
    unmute: () => void;
    toggleMute: () => void;
    setVolume: (volume: number) => void;
    setVolumeMusic: (volume: number) => void;
    setVolumeSfx: (volume: number) => void;
    preload: (track: T) => void;
};


const BASE_LOCATION = AUDIO.AUDIO_LOCATION;

const DEFAULT_AUDIO_STATE = {
    type: 'none',
    track: undefined,
    audio: undefined,
    isPlaying: false,
    isPaused: false,
} as const;

const DEFAULT_PLAY_OPTIONS: PlayOptions = {
    overlap: 'true',
    loop: false,
    volume: 1,
    volumeMusic: 1,
    volumeSfx: 1,
};

function getTrackType(track: string): TrackType {
    if (track.startsWith('music_')) {
        return 'music';
    }
    if (track.startsWith('sfx_')) {
        return 'sfx';
    }
    return 'none';
}

function normalizeVolume(volume: number): number {
    return Math.max(0, Math.min(1, volume));
}

class AudioTrack {
    readonly track: string;
    readonly type: TrackType;
    readonly el: HTMLAudioElement;
    loading: boolean;
    playOptions: PlayOptions | undefined;

    constructor(track: string, playOptions?: PlayOptions) {
        this.track = track;
        this.type = getTrackType(track);
        this.el = new Audio(`${BASE_LOCATION}${track}`);
        this.loading = true;
        this.playOptions = playOptions;
    }
}


function createAudioStore(): AudioPlayerStore {
    const { get, set: setLocal } = localPersisted<PersistedAudioSettings>(AUDIO.STORAGE_KEY, {
        muted: AUDIO.MUTED,
        volume: AUDIO.VOLUME_GENERAL,
        volume_music: AUDIO.VOLUME_MUSIC,
        volume_sfx: AUDIO.VOLUME_SFX,
    });

    const $persisted = get();

    const $ = {
        ...DEFAULT_AUDIO_STATE,
        isMuted: $persisted.muted,
        volume: $persisted.volume,
        volumeMusic: $persisted.volume_music,
        volumeSfx: $persisted.volume_sfx,
    } as AudioPlayerState;

    const { subscribe, set } = writable($);

    const cache = new Map<string, AudioTrack>();

    const playing = new Set<AudioTrack>();

    const elementToTrack = new Map<HTMLAudioElement, AudioTrack>();

    const computedVolume = {
        general: $.volume,
        music: $.volume * $.volumeMusic,
        sfx: $.volume * $.volumeSfx,
    };

    function recomputeVolume() {
        computedVolume.general = $.volume;
        computedVolume.music = $.volume * $.volumeMusic;
        computedVolume.sfx = $.volume * $.volumeSfx;
    }

    function onCanPlayThrough(this: HTMLAudioElement) {
        const t = elementToTrack.get(this);
        if (!t) {
            throw new Error('Audio element not found');
        }

        t.loading = false;
        if (!cache.has(t.track)) {
            console.error('Audio track not found in cache after loading', t);
            cache.set(t.track, t);
        }
        if (!playing.has(t) || !$.isPlaying) {
            return;
        }

        playAudio(t, t.playOptions ?? {});
        t.playOptions = undefined;
        set($);
    }

    function onEnded(this: HTMLAudioElement) {
        const t = elementToTrack.get(this);
        if (!t) {
            throw new Error('Audio element not found');
        }

        playing.delete(t);
        if (!$.isPlaying || $.track !== t.track || playing.size > 0) {
            return;
        }

        $.isPlaying = false;
        $.isPaused = false;
        // @ts-expect-error
        $.audio = undefined; $.track = undefined; $.type = 'none';
        set($);
    }

    function loadAudio(track: string, preload: HTMLMediaElement['preload'] = 'auto'): AudioTrack {
        const t = new AudioTrack(track);
        t.el.preload = preload;
        t.el.addEventListener('canplaythrough', onCanPlayThrough);
        t.el.addEventListener('ended', onEnded);
        elementToTrack.set(t.el, t);
        return t;
    }

    function playAudio(t: AudioTrack, options: PlayOptions) {
        if (!playing.has(t)) {
            playing.add(t);
        }
        $.type = t.type;
        $.track = t.track;
        $.audio = t.el;
        const volume = normalizeVolume(options.volume ?? 1) * $.volume;
        const musicVolume = normalizeVolume(options.volumeMusic ?? 1) * $.volumeMusic;
        const sfxVolume = normalizeVolume(options.volumeSfx ?? 1) * $.volumeSfx;
        t.el.volume = volume * ($.type === 'music' ? musicVolume : sfxVolume);
        t.el.loop = options.loop ?? false;
        t.el.muted = $.isMuted;
        t.el.play().catch((e) => {
            console.error(`Error playing audio: ${t.track}`, e);
        });
    }

    function pauseAll(except?: AudioTrack) {
        for (const t of playing) {
            if (t !== except) {
                t.el.pause();
            }
        }
    }

    function resumeAll(except?: AudioTrack) {
        for (const t of playing) {
            if (t === except || t.loading || !t.el.paused) {
                continue;
            }
            t.el.play().catch((e) => {
                console.error(`Error resuming audio: ${t.track}`, e);
            });
        }
    }

    function stopAll(except?: AudioTrack) {
        for (const t of playing) {
            if (t !== except) {
                t.el.pause();
                t.el.currentTime = 0;
                playing.delete(t);
            }
        }
    }

    function muteAll(state: boolean) {
        for (const t of playing) {
            t.el.muted = state;
        }
    }

    function updateVolumeAll() {
        for (const t of playing) {
            if (t.type === 'music') {
                t.el.volume = computedVolume.music;
                continue;
            }
            if (t.type === 'sfx') {
                t.el.volume = computedVolume.sfx;
                continue;
            }
            t.el.volume = computedVolume.general;
        }
    }

    return {
        subscribe,
        play(track, options) {
            $.isPlaying = true;
            $.isPaused = false;
            options ??= DEFAULT_PLAY_OPTIONS;

            let t = cache.get(track);
            if (!t) {
                t = loadAudio(track);
                t.playOptions = options;
                playing.add(t);
                cache.set(track, t);
                set($);
                return;
            }

            if (t.loading) {
                t.playOptions = options;
                playing.add(t);
                set($);
                return;
            }

            if (playing.has(t)) {
                t.el.currentTime = 0;
            }
            if (options.overlap === 'pause') {
                pauseAll(t);
            }
            else if (options.overlap === 'stop') {
                stopAll(t);
            }

            playAudio(t, options);
            set($);
        },
        pause(track) {
            if ($.isPaused) {
                return;
            }

            if (track) {
                const t = cache.get(track);
                if (t) {
                    t.el.pause();
                }
            }
            else {
                pauseAll();
            }

            $.isPaused = true;
            $.isPlaying = false;
            set($);
        },
        resume(track) {
            if ($.isPlaying) {
                return;
            }

            if (track) {
                const t = cache.get(track);
                if (t) {
                    t.el.play().catch((e) => {
                        console.error(`Error resuming audio: ${t.track}`, e);
                    });
                }
            }
            else {
                resumeAll();
            }

            $.isPaused = false;
            $.isPlaying = true;
            set($);
        },
        stop(track) {
            if (!$.isPlaying && !$.isPaused) {
                return;
            }

            if (track) {
                const t = cache.get(track);
                if (t) {
                    t.el.pause();
                    t.el.currentTime = 0;
                    playing.delete(t);
                }
            }
            else {
                stopAll();
            }

            $.isPaused = false;
            $.isPlaying = false;
            set($);
        },
        mute() {
            $persisted.muted = true;
            setLocal($persisted);

            muteAll(true);

            $.isMuted = true;
            set($);
        },
        unmute() {
            $persisted.muted = false;
            setLocal($persisted);

            muteAll(false);

            $.isMuted = false;
            set($);
        },
        toggleMute() {
            $persisted.muted = !$persisted.muted;
            setLocal($persisted);

            muteAll($persisted.muted);

            $.isMuted = $persisted.muted;
            set($);
        },
        setVolume(volume) {
            volume = normalizeVolume(volume);
            $persisted.volume = volume;
            setLocal($persisted);

            $.volume = volume;
            recomputeVolume();
            updateVolumeAll();
            set($);
        },
        setVolumeMusic(volume) {
            volume = normalizeVolume(volume);

            $persisted.volume_music = volume;
            setLocal($persisted);

            $.volumeMusic = volume;
            recomputeVolume();
            updateVolumeAll();
            set($);
        },
        setVolumeSfx(volume) {
            volume = normalizeVolume(volume);
            $persisted.volume_sfx = volume;
            setLocal($persisted);

            $.volumeSfx = volume;
            recomputeVolume();
            updateVolumeAll();
            set($);
        },
        preload(track) {
            let t = cache.get(track);
            if (t) {
                return;
            }

            t = loadAudio(track);
            cache.set(track, t);
        },
    };
}

export const audioPlayer = createAudioStore();
