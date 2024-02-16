import { users } from '$lib/server/db.js';
import { count, desc, gt, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';


export const load: PageServerLoad = async ({ locals }) => {
    const [usersData, userRankData] = await Promise.all([
        locals.db.select().from(users).orderBy(desc(users.scoreLifetime)),
        locals.user && locals.db.select({
            userRank: count(),
            totalUsers: sql<number>`(select count(*) from ${users})`
        }).from(users).where(gt(users.scoreLifetime, locals.user.scoreLifetime)).get()
    ]);

    return {
        userRank: userRankData?.userRank,
        users: usersData,
        usersTotal: userRankData?.totalUsers
    };
};
