from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Optional as _Optional

DESCRIPTOR: _descriptor.FileDescriptor

class RFIDAuthData(_message.Message):
    __slots__ = ("ID", "data")
    ID_FIELD_NUMBER: _ClassVar[int]
    DATA_FIELD_NUMBER: _ClassVar[int]
    ID: int
    data: bytes
    def __init__(self, ID: _Optional[int] = ..., data: _Optional[bytes] = ...) -> None: ...
