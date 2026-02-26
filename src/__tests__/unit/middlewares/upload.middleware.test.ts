import { fileFilter } from "../../../middlewares/upload.middleware";
import { HttpError } from "../../../errors/http-error";

describe("Middleware: upload fileFilter", () => {
  let req: any;
  let cb: jest.Mock;

  beforeEach(() => {
    req = {};
    cb = jest.fn();
  });

  it("should accept image files", () => {
    const file: any = {
      mimetype: "image/png",
    };

    fileFilter(req, file, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });

  it("should reject non-image files", () => {
    const file: any = {
      mimetype: "application/pdf",
    };

    fileFilter(req, file, cb);

    expect(cb).toHaveBeenCalled();
    const errorArg = cb.mock.calls[0][0];

    expect(errorArg).toBeInstanceOf(HttpError);
    expect(errorArg.message).toBe(
      "Invalid file type, only JPEG and PNG is allowed!"
    );
  });

  it("should reject text files", () => {
    const file: any = {
      mimetype: "text/plain",
    };

    fileFilter(req, file, cb);

    const errorArg = cb.mock.calls[0][0];
    expect(errorArg).toBeInstanceOf(HttpError);
  });

  it("should accept jpeg images", () => {
    const file: any = {
      mimetype: "image/jpeg",
    };

    fileFilter(req, file, cb);

    expect(cb).toHaveBeenCalledWith(null, true);
  });
});