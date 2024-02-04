import { AUDIO } from '$lib/defaults.js';
import { localPersisted } from '$lib/stores/clientPersisted.js';
import type { Readable } from '$lib/stores/types.js';
import { writable } from 'svelte/store';


type PersistedSettings = {
    muted: boolean;
    volume: number;
    volume_music: number;
    volume_sfx: number;
};

type ValidTracks = 'music_lobby.mp3' | 'sfx_abucheo.mp3' | 'sfx_aplauso.mp3' | 'sfx_meh.mp3' | 'sfx_round.mp3';

type TrackType = 'music' | 'sfx' | 'none';

type AudioState = ({
    type: Extract<TrackType, 'none'>;
    track: undefined;
    audio: undefined;
    isPlaying: false;
} | {
    type: Exclude<TrackType, 'none'>;
    track: ValidTracks;
    audio: HTMLAudioElement;
    isPlaying: boolean;
}) & {
    isMuted: boolean;
    isPaused: boolean;
    volume: number;
    musicVolume: number;
    sfxVolume: number;
    lastTrack?: ValidTracks;
};

type PlayOptions = {
    overlap?: boolean;
    loop?: boolean;
    volume?: number;
    duration?: number;
    stopCurrent?: boolean;
    musicVolume?: number;
    sfxVolume?: number;
};

type AudioStore = Readable<AudioState> & {
    play: <T extends ValidTracks>(track: T, config?: PlayOptions) => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    mute: () => void;
    unmute: () => void;
    toggleMute: () => void;
    setVolume: (volume: number) => void;
    setVolumeMusic: (volume: number) => void;
    setVolumeSfx: (volume: number) => void;
    preload: (src: string) => void;
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
    overlap: true,
    loop: false,
    volume: 1,
    stopCurrent: false,
    musicVolume: 1,
    sfxVolume: 1,
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

const audioCache = new Map<string, HTMLAudioElement>();

function createAudioStore(): AudioStore {
    const { get, set: setPersisted } = localPersisted<PersistedSettings>(AUDIO.STORAGE_KEY, {
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
        musicVolume: $persisted.volume_music,
        sfxVolume: $persisted.volume_sfx,
    } as AudioState;

    const { subscribe, set } = writable($);

    const pendingTracks = new Set<string>();

    function playAudio(track: string, audio: HTMLAudioElement, options: PlayOptions) {
        $.type = getTrackType(track);
        $.audio = audio;
        $.isPlaying = true;
        $.isPaused = false;
        const volume = normalizeVolume(options.volume ?? 1) * $.volume;
        const musicVolume = normalizeVolume(options.musicVolume ?? 1) * $.musicVolume;
        const sfxVolume = normalizeVolume(options.sfxVolume ?? 1) * $.sfxVolume;
        audio.volume = volume * ($.type === 'music' ? musicVolume : sfxVolume);
        audio.loop = options.loop ?? false;
        audio.muted = $.isMuted;
        audio.play().catch((e) => {
            console.info((e.name));
        });
    }

    return {
        subscribe,
        play(track, options) {
            if (pendingTracks.has(track)) {
                return;
            }

            options ??= DEFAULT_PLAY_OPTIONS;
            if ($.track === track) {
                if ($.isPlaying) {
                    $.audio.currentTime = 0;
                }
                playAudio(track, $.audio, options);
                set($);
                return;
            }

            if ($.isPlaying) {
                if (!options.overlap) {
                    $.audio.pause();
                }
            }

            $.lastTrack = $.track;
            let audio = audioCache.get(track);
            if (!audio) {
                audio = new Audio(`${BASE_LOCATION}${track}`);
                audio.preload = 'auto';
                audio.addEventListener('canplaythrough', () => {
                    pendingTracks.delete(track);
                    if ($.track !== track || !$.isPlaying) {
                        return;
                    }
                    playAudio(track, audio!, options!);
                    set($);
                });
                $.track = track;
                $.audio = audio;
                $.isPlaying = true;
                pendingTracks.add(track);
                audioCache.set(track, audio);
                set($);
                return;
            }

            playAudio(track, audio, options);
            set($);
        },
        pause() {
            if ($.isPlaying || !$.audio) {
                return;
            }

            $.isPaused = true;
            $.isPlaying = false;
            set($);
            $.audio.pause();
        },
        resume() {
            if ($.isPlaying || !$.audio) {
                return;
            }

            $.isPaused = false;
            $.isPlaying = true;
            if (!pendingTracks.has($.track)) {
                $.audio.play();
            }
            set($);
        },
        stop() {
            if (!$.audio) {
                return;
            }

            $.isPlaying = false;
            $.isPaused = false;
            $.audio.pause();
            $.audio.currentTime = 0;
            set($);
        },
        mute() {
            $persisted.muted = true;
            setPersisted($persisted);

            $.isMuted = true;
            if ($.audio) {
                $.audio.muted = true;
            }
            set($);
        },
        unmute() {
            $persisted.muted = false;
            setPersisted($persisted);

            $.isMuted = false;
            if ($.audio) {
                $.audio.muted = false;
            }
            set($);
        },
        toggleMute() {
            $persisted.muted = !$persisted.muted;
            setPersisted($persisted);

            $.isMuted = $persisted.muted;
            if ($.audio) {
                $.audio.muted = $.isMuted;
            }
            set($);
        },
        setVolume(volume) {
            volume = normalizeVolume(volume);
            $persisted.volume = volume;
            setPersisted($persisted);

            $.volume = volume;
            if ($.audio) {
                $.audio.volume = $.volume * ($.type === 'music' ? $.musicVolume : $.sfxVolume);
            }
            set($);
        },
        setVolumeMusic(volume) {
            volume = normalizeVolume(volume);

            $persisted.volume_music = volume;
            setPersisted($persisted);

            $.musicVolume = volume;
            if ($.audio && $.type === 'music') {
                $.audio.volume = $.volume * $.musicVolume;
            }
            set($);
        },
        setVolumeSfx(volume) {
            volume = normalizeVolume(volume);
            $persisted.volume_sfx = volume;
            setPersisted($persisted);

            $.sfxVolume = volume;
            if ($.audio && $.type === 'sfx') {
                $.audio.volume = $.volume * $.sfxVolume;
            }
            set($);
        },
        preload(track) {
            if (audioCache.has(track) || pendingTracks.has(track)) {
                return;
            }

            const audio = new Audio(`${BASE_LOCATION}${track}`);
            audio.preload = 'auto';
            audioCache.set(track, audio);
            pendingTracks.add(track);
            audio.addEventListener('canplaythrough', () => {
                pendingTracks.delete(track);
                if ($.track !== track || !$.isPlaying) {
                    return;
                }
                playAudio(track, audio!, {});
                set($);
            });
        },
    };
}

export const audioPlayer = createAudioStore();
