import fs from 'fs';
import path from 'path';
import ExifReader from 'exifreader';

const filePath = 'images/upload-with-bg.jpg';

const fileName = path.basename(filePath);
const fileStats = fs.statSync(filePath);
const fileSizeInKB = (fileStats.size / 1024).toFixed(4);

const imageBuffer = fs.readFileSync(filePath);

// Load EXIF and JFIF metadata
const tags = ExifReader.load(imageBuffer);
console.log('tags: ', tags);
console.log('tags.Subsampling: ', tags.Subsampling);


// Extract specific metadata fields
console.log({
    file_name: fileName,
    file_size: fileSizeInKB,
    file_type: tags['FileType']?.description,
    file_type_extension: tags['FileType']?.value,
    mime_type: tags['format']?.description,
    jfif_version: tags['JFIF Version']?.description,
    exif_byte_order: 'null',
    device_make: tags['Make']?.description,
    device_model: tags['Model']?.description,
    orientation: tags['Orientation']?.description,
    x_resolution: tags['XResolution']?.description,
    y_resolution: tags['YResolution']?.description,
    resolution_unit: tags['Resolution Unit']?.description,
    software: tags['Software']?.description,
    modify_date: tags['ModifyDate']?.value,
    y_cb_cr_positioning: tags['tags.Subsampling']?.description,
    exposure_time: tags['ExposureTime']?.value,
    f_number: tags['FNumber']?.description,
    exposure_program: tags['ExposureProgram']?.description,
    iso: tags['ISOSpeedRatings']?.description,
    exif_version: Number(tags['ExifVersion']?.description),
    date_time_original: tags['DateTimeOriginal']?.description,
    create_date: tags['CreateDate']?.description,
    components_configuration: tags['ComponentsConfiguration']?.description,
    shutter_speed_value: tags['ShutterSpeedValue']?.description,
    aperture_value: Number(String(tags['ApertureValue']?.value).split('/')[0]) / Number(String(tags['ApertureValue']?.value).split('/')[1]),
    exposure_compensation: 0,
    metering_mode: tags['MeteringMode']?.description,
    focal_length: tags['FocalLength']?.description,
    flashpix_version: Number(tags['FlashpixVersion']?.description),
    color_space: tags['ColorSpace']?.description,
    exif_image_width: tags['Image Width']?.description,
    exif_image_height: tags['Image Height']?.description,
    interop_index: tags['InteroperabilityIndex']?.description + `- DCF basic file (${tags['ColorSpace']?.description})`,
    interop_version: Number(tags['InteroperabilityVersion']?.description),
    focal_plane_x_resolution: Number(tags['FocalPlaneXResolution']?.description.split('/')[0]) / Number(tags['FocalPlaneXResolution']?.description.split('/')[1]),
    focal_plane_y_resolution: Number(tags['FocalPlaneYResolution']?.description.split('/')[0]) / Number(tags['FocalPlaneYResolution']?.description.split('/')[1]),
    focal_plane_resolution_unit: tags['FocalPlaneResolutionUnit']?.description,
    custom_rendered: tags['CustomRendered']?.description,
    exposure_mode: tags['ExposureMode']?.description,
    white_balance: tags['WhiteBalance']?.description,
    scene_capture_type: tags['SceneCaptureType']?.description,
    compression: tags['Thumbnail']?.Compression?.description,
    thumbnail_offset: tags['Thumbnail']?.JPEGInterchangeFormat?.description,
    thumbnail_length: tags['Thumbnail']?.JPEGInterchangeFormatLength?.description,
    current_iptc_digest: 'null',
    application_record_version: Number(tags['Record Version']?.description),
    iptc_digest: 'null',
    displayed_units_x: tags['FocalPlaneResolutionUnit']?.description,
    displayed_units_y: tags['FocalPlaneResolutionUnit']?.description,
    content_creator: tags['CreatorTool']?.description,
    color_profile: tags['ICCProfile']?.description,
    print_style: 'null',
    print_position: 'null',
    print_scale: 'null',
    global_angle: 'null',
});
