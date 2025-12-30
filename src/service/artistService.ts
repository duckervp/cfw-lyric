import { ArtistRepository } from '../repository/artistRepository';
import { SongArtistRepository } from '../repository/songArtistRepository';
import { ArtistInput } from '../schema/artistSchema';

export class ArtistService {
  constructor(
    private artistRepository: ArtistRepository,
    private songArtistRepository: SongArtistRepository
  ) { }

  async getAllArtists(name: string) {
    return await this.artistRepository.findAll(name)
  }

  async getArtistById(id: number) {
    return await this.artistRepository.findById(id)
  }

  async getArtistBySlug(id: string) {
    return await this.artistRepository.findBySlug(id)
  }

  async createArtist(artistData: ArtistInput) {
    return await this.artistRepository.create(artistData)
  }

  async updateArtist(id: number, artistData: Partial<ArtistInput>) {
    return await this.artistRepository.update(id, artistData)
  }

  async deleteArtist(id: number) {
    await this.songArtistRepository.deleteByArtistId(id);

    return await this.artistRepository.delete(id)
  }

  async deleteArtists(ids: number[]) {
    await this.songArtistRepository.deleteByArtistIds(ids);

    return await this.artistRepository.deleteAll(ids);
  }
} 