import { USER_ROLE } from '@wedro/types';
import { NextPage } from 'next';

export type NextPageWithAuth<T = {}> = NextPage<T> & { requiresAuth: boolean; denyLogged?: boolean; canAccess?: Array<USER_ROLE> };
