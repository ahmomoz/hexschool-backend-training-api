const uploadService = require("@/services/upload.service");

const { catchAsync } = require("@/utils/catchAsync");
const { sendSuccess } = require("@/utils/response");
const { HTTP_STATUS } = require("@/constants/httpStatus");

const uploadController = {
  uploadImage: catchAsync(async (req, res, next) => {
    const file = req.file;
    const publicUrlData = await uploadService.uploadImage(file);

    sendSuccess(res, {
      data: {
        image_url: publicUrlData.publicUrl,
      },
      message: "上傳成功",
      statusCode: HTTP_STATUS.OK,
    });
  }),
};

module.exports = uploadController;
