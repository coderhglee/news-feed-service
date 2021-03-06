import { Inject, Injectable } from '@nestjs/common';
import { Page } from 'src/page/entities/page.entity';
import { Post } from 'src/post/entities/post.entity';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { PublishEventStore } from './infra/publish-event-store';

@Injectable()
export class PublishService {
  constructor(
    private readonly subscriptionService: SubscriptionService,
    @Inject('PublishEventStore')
    private readonly eventStore: PublishEventStore,
  ) {}

  async publishPost(page: Page, postId: number) {
    await this.subscriptionService
      .findAllUserBySubscribePage(page)
      .then((subscriptions) => {
        subscriptions.forEach((element) => {
          this.eventStore.publishEvent({
            key: element.user.id,
            value: postId + '',
          });
        });
      });
  }

  async removePublishedPost(post: Post) {
    this.subscriptionService
      .findAllFromPostCreatedDate(post.page, post.createAt)
      .then((subscriptions) => {
        subscriptions.forEach((element) => {
          this.eventStore.removePublishdEvent({
            key: element.user.id,
            value: post.id.toString(),
          });
        });
      });
  }
}
