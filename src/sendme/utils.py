import socket
import logging
import qrcode
from pathlib import Path
import os
import argparse

logger = logging.getLogger(__name__)


def get_ip_address() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except Exception:
        return socket.gethostbyname(socket.gethostname())
    finally:
        s.close()


def generate_qr_code(url: str) -> None:
    try:
        qr = qrcode.QRCode(box_size=1, border=1)
        qr.add_data(url)
        qr.make()
        qr.print_ascii(invert=True)
        logger.info("QR Code generated for %s", url)
    except Exception:
        logger.exception("Failed to generate QR code")


def valid_directory(path: str) -> Path:
    p = Path(path).resolve()

    if not p.exists() or not p.is_dir():
        raise argparse.ArgumentTypeError(f"'{path}' is not a valid directory")

    if not os.access(p, os.R_OK):
        raise argparse.ArgumentTypeError(f"Directory '{path}' is not readable")

    # if not os.access(p, os.W_OK):
    #     raise argparse.ArgumentTypeError(f"Directory '{path}' is not writable")

    return p
