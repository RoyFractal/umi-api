import { Injectable } from '@nestjs/common';
import { off } from 'process';

import umi from "./umi.js"
import { UMIPREFIX } from "./umi.dto"


@Injectable()
export class UmiService {
    static async getBalance(address: string): Promise<number> {
        return await umi.getUmiBalance(address)
    }

    static async getTransactions(address: string, limit?: number, offset?: number): Promise<object> {
        return await umi.getUmiTransactions(address, limit, offset)
    }


    static async generateWallet(prefix: string = UMIPREFIX): Promise<object> {
        let wallet = await umi.generateWallet(prefix)
        wallet.keys.publicKey = Array.from(wallet.keys.publicKey)
        wallet.keys.privateKey = Array.from(wallet.keys.privateKey)
        return wallet
    }


    static async send(privateKey: Array<number>, publicKey: Array<number>,
        targetAddress: string, amount: number, prefix: string = UMIPREFIX): Promise<boolean | object> {
        return await umi.send(privateKey, publicKey, targetAddress, amount * 100, prefix)
    }

    static async signMessage(privateKey: Array<number>, message: string): Promise<string> {
        return Buffer.from(await umi.signMessage(message, privateKey)).toString('base64')
    }

    static async restoreWallet(mnemonic: string, prefix: string = UMIPREFIX): Promise<object> {
        let restored = await umi.restoreWallet(mnemonic, prefix)
        restored.keys.publicKey = Array.from(restored.keys.publicKey)
        restored.keys.privateKey = Array.from(restored.keys.privateKey)
        return restored
    }
}


//todo описания параметров методов