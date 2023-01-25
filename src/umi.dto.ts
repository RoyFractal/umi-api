import { ApiProperty } from '@nestjs/swagger';

export const UMIPREFIX = "umi"

export class SendUmiDto {
  @ApiProperty()
  privateKey: Array<number>;
  @ApiProperty()
  publicKey: Array<number>;
  @ApiProperty()
  targetAddress: string;
  @ApiProperty()
  amount: number;
  @ApiProperty({default: UMIPREFIX, required: false})
  prefix: string = UMIPREFIX;
}


export class SignMessageDto {
  @ApiProperty()
  privateKey: Array<number>;
  @ApiProperty()
  message: string;
}


export class RestoreWalletDto {
  @ApiProperty()
  mnemonic: string;
  @ApiProperty({default: UMIPREFIX, required: false})
  prefix: string = UMIPREFIX;
}


export class GenerateWalletDto {
  @ApiProperty({default: UMIPREFIX, required: false})
  prefix: string = UMIPREFIX;
}
