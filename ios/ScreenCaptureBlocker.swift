import Foundation
import UIKit

@objc(ScreenCaptureBlocker)
class ScreenCaptureBlocker: NSObject {

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc func blockScreenCapture() {
    DispatchQueue.main.async {
      if #available(iOS 11.0, *) {
        // Ajouter une observation pour détecter les captures d'écran
        NotificationCenter.default.addObserver(
          self,
          selector: #selector(self.screenCaptureChanged),
          name: UIScreen.capturedDidChangeNotification,
          object: nil
        )
      }
    }
  }

  @objc func unblockScreenCapture() {
    DispatchQueue.main.async {
      if #available(iOS 11.0, *) {
        // Supprimer l'observation
        NotificationCenter.default.removeObserver(
          self,
          name: UIScreen.capturedDidChangeNotification,
          object: nil
        )
      }
    }
  }

  @objc func screenCaptureChanged() {
    if #available(iOS 11.0, *) {
      if UIScreen.main.isCaptured {
        print("L'écran est en cours de capture !")
        // Vous pouvez ajouter ici une logique pour réagir à la capture d'écran
      }
    }
  }
}
