import type { NodeRepository, CreateNodeInput, UpdateNodeContentInput } from '@/shared/application/repositories';
import type { MapNode } from '@/shared/domain/types';

export class CreateNodeUseCase {
  constructor(private readonly nodeRepository: NodeRepository) {}

  async execute(input: CreateNodeInput): Promise<MapNode> {
    const node = await this.nodeRepository.create({
      ...input,
      nodeType: input.nodeType ?? 'concept',
    });

    if (input.parentNodeId) {
      await this.nodeRepository.incrementChildCount(input.parentNodeId);
    }

    return node;
  }
}

export class UpdateNodeContentUseCase {
  constructor(private readonly nodeRepository: NodeRepository) {}

  async execute(input: UpdateNodeContentInput): Promise<MapNode> {
    return this.nodeRepository.updateContent(input);
  }
}

export class MoveNodeUseCase {
  constructor(private readonly nodeRepository: NodeRepository) {}

  async execute(
    nodeId: string,
    updatedBy: string,
    expectedVersion: number,
    posX: number,
    posY: number
  ): Promise<MapNode> {
    return this.nodeRepository.updatePosition({
      id: nodeId,
      updatedBy,
      expectedVersion,
      posX,
      posY,
    });
  }
}

export class DeleteNodeUseCase {
  constructor(private readonly nodeRepository: NodeRepository) {}

  async execute(nodeId: string): Promise<void> {
    return this.nodeRepository.softDelete(nodeId);
  }
}
