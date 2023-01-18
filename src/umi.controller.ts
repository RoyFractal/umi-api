import { HttpException } from '@nestjs/common';
import { Controller, Get, Param, Post, Body, HttpStatus, Res, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { off } from 'process';
import { SendUmiDto, SignMessageDto, RestoreWalletDto } from './umi.dto';
import { UmiService } from './umi.service'


@ApiTags('wallet')
@Controller()
export class UmiController {
    constructor(private readonly umiService: UmiService) { }

    @Get("get_balance/:address")
    async getBalance(@Param('address') address: string): Promise<object> {
        return { balance: await UmiService.getBalance(address) }
    }


    @Get("get_transactions/:address/")
    @ApiQuery({
        name: "limit",
        type: Number,
        description: "Count of transactions",
        required: false
    })
    @ApiQuery({
        name: "offset",
        type: Number,
        description: "Transactions offset",
        required: false
    })
    async getTransactions(@Param('address') address: string, @Query('limit') limit?: number, @Query('offset') offset?: number): Promise<object> {
        return { balance: await UmiService.getTransactions(address, limit, offset) }
    }

    @Post("generate_wallet")
    async generateWallet(): Promise<object> {
        return { wallet: await UmiService.generateWallet() }
    }

    @Post("send_umi")
    async sendUmi(@Body() sendUmiDto: SendUmiDto): Promise<object> {
        return {
            result: await UmiService.sendUmi(
                sendUmiDto.privateKey, sendUmiDto.publicKey, sendUmiDto.targetAddress, sendUmiDto.amount
            )
        }
    }

    @Post("sign_message")
    async signMessage(@Body() signMessageDto: SignMessageDto): Promise<object> {
        return {
            result: await UmiService.signMessage(signMessageDto.privateKey, signMessageDto.message)
        }
    }

    @Post("restore_wallet")
    async restoreWallet(@Body() restoreWalletDto: RestoreWalletDto): Promise<object> {
        return {
            result: await UmiService.restoreWallet(restoreWalletDto.mnemonic)
        }
    }
}
