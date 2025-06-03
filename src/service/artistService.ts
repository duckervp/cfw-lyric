import { ArtistRepository } from '../repository/artistRepository';
import { ArtistInput } from '../schema/artistSchema';

export class ArtistService {
  constructor(private artistRepository: ArtistRepository) {}

  async getAllArtists(name: string) {
    return await this.artistRepository.findAll(name)
  }

  async getArtistById(id: number) {
    return await this.artistRepository.findById(id)
  }
  
  async createArtist(artistData: ArtistInput) {
    return await this.artistRepository.create(artistData)
  }

  async updateArtist(id: number, artistData: Partial<ArtistInput>) {
    return await this.artistRepository.update(id, artistData)
  }

  async deleteArtist(id: number) {
    return await this.artistRepository.delete(id)
  }
} 