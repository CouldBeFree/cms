import Folder from '../models/Folder';

export default
class FolderRepo {
  static async getRoot (ownerId) {
    let root = await Folder.findOne({ 'owner._id': ownerId, parentId: null });
    if (!root) {
      root = new Folder({ parentId: null });
      root.owner = { _id: ownerId };
      await root.save();
    }
    return root;
  }

  static async isExists (title, parentId = null) {
    return !!await Folder.countDocuments({ title, parentId });
  }
}
