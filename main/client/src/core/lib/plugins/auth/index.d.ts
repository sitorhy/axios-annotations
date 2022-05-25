import Authorizer from "./authorizer";
import Config from "../../core/config";

export default function AuthorizationPlugin(authorizer: Authorizer): (config: Config) => void;