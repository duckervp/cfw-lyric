import { SongRepository } from "../repository/songRepository";
import { SongInput } from "../schema/songSchema";
import { SongArtistRepository } from "../repository/songArtistRepository";

export class SongService {
  constructor(
    private songRepository: SongRepository,
    private songArtistRepository: SongArtistRepository
  ) {}

  async getAllSongs(
    title?: string,
    artist?: string,
    artistId?: number,
    page?: number,
    pageSize?: number
  ) {
    return await this.songRepository.findAll(
      title,
      artist,
      artistId,
      page,
      pageSize
    );
  }

  async getSongById(id: number) {
    return await this.songRepository.findById(id);
  }

  async createSong(songData: SongInput) {
    const song = await this.songRepository.create(songData);
    const artists = songData.artists.map((artist) => ({
      songId: song.id,
      artistId: artist.artistId,
      type: artist.type,
    }));
    await this.songArtistRepository.create(artists);
    return song;
  }

  async updateSong(id: number, songData: Partial<SongInput>) {
    const song = await this.songRepository.findById(id);
    if (!song) {
      throw new Error("Song not found");
    }

    const newSongArtists = songData.artists
      ?.filter((songArtist) => songArtist.id === undefined)
      .map((songArtist) => ({
        songId: song.id,
        artistId: songArtist.artistId,
        type: songArtist.type,
      }));

    await this.songArtistRepository.create(newSongArtists ?? []);

    const oldSongArtists = await this.songArtistRepository.findBySongId(
      song.id
    );

    const deleteSongArtistIds = oldSongArtists
      .filter((oldSongArtist) =>
        songData.artists?.every(
          (songArtist) => songArtist.id !== oldSongArtist.id
        )
      )
      .map((songArtist) => songArtist.id);

    await this.songArtistRepository.deleteMany(deleteSongArtistIds);

    const updateSongArtists = songData.artists
      ?.filter(
        (songArtist) =>
          songArtist.id !== undefined &&
          !deleteSongArtistIds.includes(songArtist.id)
      )
      .map((songArtist) => ({
        id: songArtist.id,
        songId: song.id,
        artistId: songArtist.artistId,
        type: songArtist.type,
      }));

    await this.songArtistRepository.updateMany(updateSongArtists ?? []);

    const songUpdate = { ...songData };
    delete songUpdate.artists;

    return await this.songRepository.update(id, songUpdate);
  }

  async deleteSong(id: number) {
    return await this.songRepository.delete(id);
  }
}
