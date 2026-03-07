import { and, desc, eq } from 'drizzle-orm';

import { NewPicbedImage, picbedImages } from '../schemas';
import { LobeChatDatabase } from '../type';

export class PicbedModel {
  private userId: string;
  private db: LobeChatDatabase;

  constructor(db: LobeChatDatabase, userId: string) {
    this.userId = userId;
    this.db = db;
  }

  create = async (params: Omit<NewPicbedImage, 'id' | 'userId'>) => {
    const [result] = await this.db
      .insert(picbedImages)
      .values({ ...params, userId: this.userId })
      .returning();
    return result;
  };

  query = async () => {
    return this.db.query.picbedImages.findMany({
      orderBy: [desc(picbedImages.createdAt)],
      where: eq(picbedImages.userId, this.userId),
    });
  };

  delete = async (id: string) => {
    return this.db
      .delete(picbedImages)
      .where(and(eq(picbedImages.id, id), eq(picbedImages.userId, this.userId)));
  };
}
