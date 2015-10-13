/**
 * Created by Jerico on 02/10/2015.
 */
describe("Testing FluidIterator", function () {

    beforeEach(function () {
        module("fluid.utils");
    });


    it("FluidIterator is defined", inject(function (FluidFactory) {
        expect(FluidFactory).toBeDefined();
    }));


});