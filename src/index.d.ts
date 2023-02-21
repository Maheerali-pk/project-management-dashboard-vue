import { Store } from "vuex";
import store, { CommitType, GettersType } from "./store";

declare module "vue/types/vue" {
   interface Vue {
      $store: string;
      store: MyStore;
   }
}
declare module "v-calendar";

export interface MyStore {
   state: IState;
   getters: GettersType;
   commit: CommitType;
}
