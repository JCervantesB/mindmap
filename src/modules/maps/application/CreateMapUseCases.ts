import type { MapRepository, CreateMapInput } from '@/shared/application/repositories';
import type { MindMap } from '@/shared/domain/types';

export interface CreateMapFromInterviewInput {
  ownerId: string;
  topic: string;
  objective: string;
  audience: string;
  knowledgeLevel: string;
  depthPreference: string;
}

export class CreateMapFromInterviewUseCase {
  constructor(private readonly mapRepository: MapRepository) {}

  async execute(input: CreateMapFromInterviewInput): Promise<MindMap> {
    const createInput: CreateMapInput = {
      ownerId: input.ownerId,
      title: `Mapa de ${input.topic}`,
      rootTopic: input.topic,
      purpose: input.objective,
      audience: input.audience,
      knowledgeLevel: input.knowledgeLevel,
      depthPreference: input.depthPreference,
      status: 'draft',
    };

    return this.mapRepository.create(createInput);
  }
}

export class CreateEmptyMapUseCase {
  constructor(private readonly mapRepository: MapRepository) {}

  async execute(ownerId: string, title: string, rootTopic: string): Promise<MindMap> {
    return this.mapRepository.create({
      ownerId,
      title,
      rootTopic,
      status: 'draft',
    });
  }
}
