export default logger;
declare namespace logger {
    const baseStyle: string;
    namespace colors {
        const log: string;
        const error: string;
        const warn: string;
    }
    function log(message: any, secondary: any): void;
    function log(message: any, secondary: any): void;
    function error(message: any, secondary: any): void;
    function error(message: any, secondary: any): void;
    function warn(message: any, secondary: any): void;
    function warn(message: any, secondary: any): void;
}
