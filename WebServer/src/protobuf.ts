// Protobuf definitions

import { Message, Type, Field } from 'protobufjs/light';


@Type.d("RFIDAuthData")
export class RFIDAuthData extends Message<RFIDAuthData> {
  @Field.d(1, "uint32", "required")
  public ID!: number;
  @Field.d(2, "bytes", "required")
  public data!: Uint8Array;
}