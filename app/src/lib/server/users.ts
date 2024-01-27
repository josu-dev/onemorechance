export type User = {
    id: string;
    name: string;
    role: string;
    totalScore: number;
}

const users = new Map<string, User>();

export async function createUser(id:string, username:string) {
    const user = {
        id: id,
        name: username,
        role: 'none',
        totalScore: 0,
    }
    users.set(user.id, user);
    return user;
}

export async function getUser(id: string): Promise<User|undefined> {
    const user = users.get(id);
    if (!user) {
        return undefined
    }
    
    return user;
}

export async function updateUser(id: string, user: User) {
    users.set(id, user);
}

export async function deleteUser(id: string) :Promise<boolean>{
    return users.delete(id);
}
