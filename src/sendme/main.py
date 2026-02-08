import argparse
import logging
import uvicorn

from .app import create_app
from .config import config, setup_logging
from .utils import valid_directory, get_ip_address, generate_qr_code, validate_auth

logger = logging.getLogger(__name__)


def parse_arguments():
    parser = argparse.ArgumentParser(description=config.DESCRIPTION)
    parser.add_argument(
        "directory",
        nargs="?",
        type=valid_directory,
        default=".",
        help="Directory to serve (default: current directory)",
    )
    parser.add_argument(
        "-a",
        "--auth",
        help="Enable authentication. Format: 'username:password'",
        type=validate_auth,
    )
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=8000,
        help="Port to run the server on (default: 8000)",
    )
    parser.add_argument(
        "-H",
        "--host",
        default="0.0.0.0",
        help="Host/interface to bind (default: 0.0.0.0)",
    )
    parser.add_argument(
        "--qr", action="store_true", help="Generate QR code for easy access"
    )
    parser.add_argument(
        "-d",
        "--allow-delete",
        action="store_true",
        help="Allow delete operations",
        default=False,
    )
    return parser.parse_args()


def print_server_info():
    separator = "=" * 55
    logger.info(separator)
    logger.info("%s %s", config.DESCRIPTION, config.VERSION)
    logger.info(separator)

    if config.SHOW_QR:
        host = config.HOST
        if host == "0.0.0.0":
            host = get_ip_address()
        generate_qr_code(f"http://{host}:{config.PORT}")

    logger.info("Base Directory : %s", config.BASE_DIR)
    logger.info("Bind           : %s:%s", config.HOST, config.PORT)
    logger.info(separator)


def cli():
    args = parse_arguments()

    config.BASE_DIR = args.directory
    config.AUTH_CREDENTIALS = args.auth
    config.PORT = args.port
    config.HOST = args.host
    config.SHOW_QR = args.qr
    config.ALLOW_DELETE = args.allow_delete

    setup_logging()
    print_server_info()

    app = create_app()
    uvicorn.run(app, host=config.HOST, port=config.PORT)
