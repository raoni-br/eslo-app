import { objectType } from 'nexus';

import { EsloContext } from '../context';
import { User } from './user';

export const Invitation = objectType({
    name: 'Invitation',
    definition(t) {
        t.nonNull.id('id');
        t.string('sourceType');
        t.string('sourceId');
        t.string('inviteeEmail');
        t.string('inviteeFirstName');
        t.string('inviteeSurname');
        t.string('status');
        t.field('inviter', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.inviterId),
        });
        t.field('invitee', {
            type: User,
            resolve: (parent, _, context: EsloContext) => context.models.user.findById(parent.inviteeId),
        });
    },
});
