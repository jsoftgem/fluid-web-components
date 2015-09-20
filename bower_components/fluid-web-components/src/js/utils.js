/**
 * Created by jerico on 9/16/15.
 */
function getValue(object, field) {
    if (field) {
        for (var item in object) {
            if (item === field) {
                this.value = object[item];
                break;
            }
        }

    } else {
        this.value = object;
    }
    return this;
}

/**
 * Checks the bootstrap brand attribute (primary,info,warning,success,danger) if exists
 * returns their String value if true
 * @param attr
 */
function getBootstrapBrand(attr) {

    var bootstrapBrand = "";

    if (attr.primary !== undefined) {
        bootstrapBrand = "primary";
    }

    if (attr.info !== undefined) {
        bootstrapBrand = "info";
    }

    if (attr.success !== undefined) {
        bootstrapBrand = "success";
    }

    if (attr.warning !== undefined) {
        bootstrapBrand = "warning";
    }

    if (attr.danger !== undefined) {
        bootstrapBrand = "danger";
    }


    return bootstrapBrand;

}